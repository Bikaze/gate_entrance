const { z } = require('zod');

const computerRegistrationSchema = z.object({
  regNo: z.number().optional(),
  nationalId: z.number().optional(),
  serialNo: z.string().nonempty(),
  brand: z.string().nonempty()
});

const computerUpdateSchema = z.object({
  regNo: z.number().optional(),
  nationalId: z.number().optional(),
  serialNo: z.string().nonempty(),
  brand: z.string().nonempty()
});

const qrCodeGenerationSchema = z.object({
  count: z.number().int().positive().max(1000)
});

exports.validateComputerRegistration = (data) => {
  const result = computerRegistrationSchema.safeParse(data);
  return result.success ? null : result.error.errors.map(e => e.message).join(', ');
};

exports.validateComputerUpdate = (data) => {
  const result = computerUpdateSchema.safeParse(data);
  return result.success ? null : result.error.errors.map(e => e.message).join(', ');
};

exports.validateQRCodeGeneration = (data) => {
  const result = qrCodeGenerationSchema.safeParse(data);
  return result.success ? null : result.error.errors.map(e => e.message).join(', ');
};
