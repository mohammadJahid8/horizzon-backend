export function calculatePartnerPercentage(
  fields: string[],
  personalInfo: any
) {
  if (!personalInfo || Object.keys(personalInfo).length === 0) {
    return 0;
  }

  const completedFields = fields.filter(
    field =>
      personalInfo[field] !== undefined &&
      personalInfo[field] !== null &&
      personalInfo[field] !== ''
  );
  const completionPercentage = Math.floor(
    (completedFields.length / fields.length) * 100
  );
  return completionPercentage;
}
