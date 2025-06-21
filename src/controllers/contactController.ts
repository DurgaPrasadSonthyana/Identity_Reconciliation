import { Request, Response } from 'express';
import { getOrCreateContact, ContactChainResponse } from '../services/contactService';

export const identifyContact = async (req: Request, res: Response): Promise<void> => {
  const { email, phoneNumber } = req.body;

  try {
    const contactPayload: ContactChainResponse = await getOrCreateContact(email, phoneNumber);
    res.status(200).json({ contact: contactPayload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error identifying contact', error: err });
  }
};
