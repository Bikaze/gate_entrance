const { z } = require('zod');

const computerSchema = z.object({
  regNo: z.number().optional(),
  nationalId: z.number().optional(),
  serialNo: z.string().min(1, { message: "serialNo cannot be empty" }),
  brand: z.string().min(1, { message: "brand cannot be empty" })
});

const qrCodeGenerationSchema = z.object({
  count: z.number().int().positive().max(1000, { message: "count must be between 1 and 1000" })
});

const base64Regex = /^data:image\/(jpeg|png|gif);base64,[A-Za-z0-9+/=]+$/;

const userSchema = z.object({
  regNo: z.number().optional(),
  nationalId: z.number().optional(),
  name: z.string().min(1, { message: "name cannot be empty" }),
  photo: z.string().min(1, { message: "photo cannot be empty" }).regex(base64Regex, { message: "Invalid photo format" }), // Validate as non-empty string and Base64 format
  type: z.enum(['student', 'guest'])
}).refine(data => !(data.regNo && data.nationalId), {
  message: "User cannot have both regNo and nationalId",
  path: ["regNo", "nationalId"]
});

exports.validateUser = (data) => {
  const result = userSchema.safeParse(data);
  return result.success ? null : result.error.errors.map(e => e.message).join(', ');
};

exports.validateComputer = (data) => {
  const result = computerSchema.safeParse(data);
  return result.success ? null : result.error.errors.map(e => e.message).join(', ');
};

exports.validateQRCodeGeneration = (data) => {
  const result = qrCodeGenerationSchema.safeParse(data);
  return result.success ? null : result.error.errors.map(e => e.message).join(', ');
};
