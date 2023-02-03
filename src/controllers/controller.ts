/** source/controllers/posts.ts */
import { Request, Response, NextFunction } from 'express';
import Example from '../models/model'

interface Example {
  message: string
}


export const addMessage = async (req: Request, res: Response) => {
  try {
      // Create a new example
      console.log("Creating a new example...");

      console.log("HERE: " + req.body.body)

      const exampleInstance = new Example({message: req.body.body});
      exampleInstance.save();

  } catch (error: any) {
      // Error
      console.error(error.message);
      return res.status(500).send({ message: error.message });
  } finally {
      // Success
      const successMessage = "Successfully created a new example!";
      console.log(successMessage);
      return res.status(201).send({ message: "Congrats ass hole" });
  }
};
