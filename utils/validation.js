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

exports.validateComputer = (data) => {
  const result = computerSchema.safeParse(data);
  return result.success ? null : result.error.errors.map(e => e.message).join(', ');
};

exports.validateQRCodeGeneration = (data) => {
  const result = qrCodeGenerationSchema.safeParse(data);
  return result.success ? null : result.error.errors.map(e => e.message).join(', ');
};
