/* eslint-disable @typescript-eslint/no-this-alias */
import { Schema, model } from 'mongoose';

const ProfessionalInfoSchema = new Schema<any>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    education: [
      {
        degree: String,
        institution: String,
        yearOfGraduation: Date,
        fieldOfStudy: String,
        grade: String,
      },
    ],
    experience: [
      {
        jobTitle: String,
        companyName: String,
        duration: String,
        responsibilities: String,
      },
    ],
    certifications: [
      {
        title: String,
        institution: String,
        issueDate: Date,
        expireDate: Date,
        credentialId: String,
        credentialUrl: String,
        certificateFile: String,
      },
    ],
    skills: [String],
  },
  {
    timestamps: true,
  }
);

export const ProfessionalInfo = model<any>(
  'ProfessionalInformation',
  ProfessionalInfoSchema
);
