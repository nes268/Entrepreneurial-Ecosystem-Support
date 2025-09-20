import mongoose, { Document, Schema } from 'mongoose';

export interface IInvestor extends Document {
  name: string;
  firm: string;
  email: string;
  phoneNumber: string;
  investmentRange: string;
  focusAreas: string[];
  backgroundSummary: string;
  profilePicture: string;
  userId?: mongoose.Types.ObjectId;
  
  // Additional investor information
  linkedinProfile?: string;
  website?: string;
  location?: string;
  position?: string;
  
  // Investment preferences
  preferences: {
    minInvestment: number;
    maxInvestment: number;
    preferredSectors: string[];
    preferredStages: string[];
    geographicFocus: string[];
    investmentCriteria: string[];
  };
  
  // Portfolio
  portfolio: {
    startupId: mongoose.Types.ObjectId;
    investmentAmount: number;
    investmentDate: Date;
    equityPercentage?: number;
    status: 'active' | 'exited' | 'written_off';
  }[];
  
  // Statistics
  stats: {
    totalInvestments: number;
    totalAmountInvested: number;
    activeInvestments: number;
    successfulExits: number;
    averageInvestmentSize: number;
  };
  
  // Status
  isActive: boolean;
  isVerified: boolean;
  
  createdAt: Date;
  updatedAt: Date;
}

const investorSchema = new Schema<IInvestor>({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  firm: {
    type: String,
    required: [true, 'Firm name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  investmentRange: {
    type: String,
    required: [true, 'Investment range is required'],
    trim: true,
  },
  focusAreas: [{
    type: String,
    required: true,
    trim: true,
  }],
  backgroundSummary: {
    type: String,
    required: [true, 'Background summary is required'],
    trim: true,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  
  // Additional investor information
  linkedinProfile: String,
  website: String,
  location: String,
  position: String,
  
  // Investment preferences
  preferences: {
    minInvestment: {
      type: Number,
      default: 0,
    },
    maxInvestment: {
      type: Number,
      default: 1000000,
    },
    preferredSectors: [String],
    preferredStages: [String],
    geographicFocus: [String],
    investmentCriteria: [String],
  },
  
  // Portfolio
  portfolio: [{
    startupId: {
      type: Schema.Types.ObjectId,
      ref: 'Startup',
      required: true,
    },
    investmentAmount: {
      type: Number,
      required: true,
    },
    investmentDate: {
      type: Date,
      required: true,
    },
    equityPercentage: Number,
    status: {
      type: String,
      enum: ['active', 'exited', 'written_off'],
      default: 'active',
    },
  }],
  
  // Statistics
  stats: {
    totalInvestments: {
      type: Number,
      default: 0,
    },
    totalAmountInvested: {
      type: Number,
      default: 0,
    },
    activeInvestments: {
      type: Number,
      default: 0,
    },
    successfulExits: {
      type: Number,
      default: 0,
    },
    averageInvestmentSize: {
      type: Number,
      default: 0,
    },
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for better query performance
investorSchema.index({ email: 1 });
investorSchema.index({ isActive: 1 });
investorSchema.index({ isVerified: 1 });
investorSchema.index({ focusAreas: 1 });
investorSchema.index({ 'preferences.preferredSectors': 1 });
investorSchema.index({ 'preferences.preferredStages': 1 });

export const Investor = mongoose.model<IInvestor>('Investor', investorSchema);
