import mongoose, { Document, Schema } from 'mongoose';

export interface IProfile extends Document {
  userId: mongoose.Types.ObjectId;
  
  // Step 1: Personal Information
  fullName: string;
  email: string;
  phoneNumber: string;
  location: string;
  
  // Step 2: Enterprise Information
  startupName: string;
  entityType: string;
  applicationType: 'innovation' | 'incubation';
  founderName: string;
  coFounderNames: string[];
  sector: string;
  linkedinProfile: string;
  
  // Step 3: Incubation Details
  previouslyIncubated: boolean;
  incubatorName?: string;
  incubatorLocation?: string;
  incubationDuration?: string;
  incubatorType?: string;
  incubationMode?: 'online' | 'offline' | 'hybrid';
  supportsReceived?: string[];
  
  // Step 4: Documentation
  aadhaarDoc: string; // required
  incorporationCert?: string;
  msmeCert?: string;
  dpiitCert?: string;
  mouPartnership?: string;
  
  // Step 5: Pitch Deck & Traction
  businessDocuments?: string[];
  tractionDetails?: string[];
  balanceSheet?: string;
  
  // Step 6: Funding Information
  fundingStage: string;
  alreadyFunded: boolean;
  fundingAmount?: number;
  fundingSource?: string;
  fundingDate?: Date;
  
  // Additional fields
  isComplete: boolean;
  completionPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

const profileSchema = new Schema<IProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  
  // Step 1: Personal Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
  },
  
  // Step 2: Enterprise Information
  startupName: {
    type: String,
    required: [true, 'Startup name is required'],
    trim: true,
  },
  entityType: {
    type: String,
    required: [true, 'Entity type is required'],
    trim: true,
  },
  applicationType: {
    type: String,
    enum: ['innovation', 'incubation'],
    required: [true, 'Application type is required'],
  },
  founderName: {
    type: String,
    required: [true, 'Founder name is required'],
    trim: true,
  },
  coFounderNames: [{
    type: String,
    trim: true,
  }],
  sector: {
    type: String,
    required: [true, 'Sector is required'],
    trim: true,
  },
  linkedinProfile: {
    type: String,
    trim: true,
  },
  
  // Step 3: Incubation Details
  previouslyIncubated: {
    type: Boolean,
    default: false,
  },
  incubatorName: String,
  incubatorLocation: String,
  incubationDuration: String,
  incubatorType: String,
  incubationMode: {
    type: String,
    enum: ['online', 'offline', 'hybrid'],
  },
  supportsReceived: [String],
  
  // Step 4: Documentation
  aadhaarDoc: {
    type: String,
    required: [true, 'Aadhaar document is required'],
  },
  incorporationCert: String,
  msmeCert: String,
  dpiitCert: String,
  mouPartnership: String,
  
  // Step 5: Pitch Deck & Traction
  businessDocuments: [String],
  tractionDetails: [String],
  balanceSheet: String,
  
  // Step 6: Funding Information
  fundingStage: {
    type: String,
    required: [true, 'Funding stage is required'],
    trim: true,
  },
  alreadyFunded: {
    type: Boolean,
    default: false,
  },
  fundingAmount: Number,
  fundingSource: String,
  fundingDate: Date,
  
  // Additional fields
  isComplete: {
    type: Boolean,
    default: false,
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
}, {
  timestamps: true,
});

// Index for better query performance
profileSchema.index({ userId: 1 });
profileSchema.index({ applicationType: 1 });
profileSchema.index({ sector: 1 });
profileSchema.index({ isComplete: 1 });

// Calculate completion percentage before saving
profileSchema.pre('save', function (next) {
  const requiredFields = [
    'fullName', 'email', 'phoneNumber', 'location',
    'startupName', 'entityType', 'applicationType', 'founderName', 'sector',
    'aadhaarDoc', 'fundingStage'
  ];
  
  let completedFields = 0;
  requiredFields.forEach(field => {
    if (this.get(field)) {
      completedFields++;
    }
  });
  
  this.completionPercentage = Math.round((completedFields / requiredFields.length) * 100);
  this.isComplete = this.completionPercentage === 100;
  
  next();
});

export const Profile = mongoose.model<IProfile>('Profile', profileSchema);
