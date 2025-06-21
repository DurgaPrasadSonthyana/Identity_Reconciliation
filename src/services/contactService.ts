// src/services/contactService.ts

import { Op } from 'sequelize';
import Contact from '../models/contact';

export interface ContactChainResponse {
  primaryContactId: number;
  emails: string[];
  phoneNumbers: string[];
  secondaryContactIds: number[];
}

/**
 * Finds or creates the correct contact cluster for the given email/phone,
 * and handles merging two existing primaries into one cluster if both fields
 * point to different primaries.
 */
export async function getOrCreateContact(
  email?: string,
  phoneNumber?: string
): Promise<ContactChainResponse> {
  // 1) If user supplied BOTH email & phone, check for two different primaries
  if (email && phoneNumber) {
    const emailContact = await Contact.findOne({ where: { email } });
    const phoneContact = await Contact.findOne({ where: { phoneNumber } });

    if (emailContact && phoneContact) {
      // figure out each record’s primary
      const emailPrimaryId = emailContact.linkedId ?? emailContact.id;
      const phonePrimaryId = phoneContact.linkedId ?? phoneContact.id;

      if (emailPrimaryId !== phonePrimaryId) {
        // two different primary clusters → we must merge them
        const primaries = await Contact.findAll({
          where: { id: { [Op.in]: [emailPrimaryId, phonePrimaryId] } },
          order: [['createdAt', 'ASC']]
        });
        const [older, younger] = primaries; // older = keep as primary

        // demote the younger
        await Contact.update(
          { linkPrecedence: 'secondary', linkedId: older.id },
          { where: { id: younger.id } }
        );
      }
    }
  }

  // 2) Now look for ANY existing contact by email OR phone
  const existing = await Contact.findOne({
    where: {
      [Op.or]: [
        { email  : email  ?? null },
        { phoneNumber: phoneNumber ?? null }
      ]
    }
  });

  // 2a) If none found, create a brand-new primary
  if (!existing) {
    const primary = await Contact.create({
      email:       email  ?? null,
      phoneNumber: phoneNumber ?? null,
      linkPrecedence: 'primary'
    });
    return buildResponse([primary]);
  }

  // 2b) We have at least one match. Compute the root primary ID:
  const primaryId = existing.linkedId ?? existing.id;

  // 3) Load the entire cluster: the primary record + all secondaries
  let chain = await Contact.findAll({
    where: {
      [Op.or]: [
        { id: primaryId },
        { linkedId: primaryId }
      ]
    }
  });

  // 4) If the incoming email or phone is brand-new to this cluster, insert as secondary
  const emailsInChain = new Set(chain.map(c => c.email).filter(Boolean) as string[]);
  const phonesInChain = new Set(chain.map(c => c.phoneNumber).filter(Boolean) as string[]);

  const needsNewSecondary =
    (email       && !emailsInChain.has(email)) ||
    (phoneNumber && !phonesInChain.has(phoneNumber));

  if (needsNewSecondary) {
    await Contact.create({
      email, phoneNumber,
      linkedId:       primaryId,
      linkPrecedence: 'secondary'
    });

    // reload the cluster after insertion
    chain = await Contact.findAll({
      where: {
        [Op.or]: [
          { id: primaryId },
          { linkedId: primaryId }
        ]
      }
    });
  }

  // 5) Build and return the normalized response
  return buildResponse(chain);
}

/** Turn a raw array of Contact instances into the API response shape */
function buildResponse(chain: Contact[]): ContactChainResponse {
  // find the one marked primary
  const primary = chain.find(c => c.linkPrecedence === 'primary');
  if (!primary) {
    console.error('❌ buildResponse: no primary in chain', chain);
    throw new Error('Primary contact not found');
  }

  const emails = Array.from(
    new Set(chain.map(c => c.email as string | null).filter((e): e is string => !!e && e.trim() !== ''))
  );
  const phoneNumbers = Array.from(
    new Set(chain.map(c => c.phoneNumber as string | null).filter((p): p is string => !!p && p.trim() !== ''))
  );
  const secondaryContactIds = chain
    .filter(c => c.linkPrecedence === 'secondary')
    .map(c => c.id);

  return {
    primaryContactId: primary.id,
    emails,
    phoneNumbers,
    secondaryContactIds
  };
}
