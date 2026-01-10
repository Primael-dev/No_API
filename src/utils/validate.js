import { ValidationException } from "#utils/exceptions";


export function validateData(schema, data) {
  const result = schema.safeParse(data);

  if (!result.success) {
    // .flatten().fieldErrors renvoie un objet du type : { email: ["Format invalide"], password: ["Trop court"] }
    throw new ValidationException(result.error.flatten().fieldErrors);
  }

  return result.data;
}