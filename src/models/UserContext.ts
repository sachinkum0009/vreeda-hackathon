// models/UserContext.ts
import mongoose, { Document, Model, Schema } from 'mongoose';

// Define the structure of the ApiAccessTokens
interface ApiAccessTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiration: Date; // Expiration time for the access token
  refreshTokenExpiration: Date; // Expiration time for the refresh token
}

// Define the structure of the Configuration field
interface Configuration {
  devices?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any; // Allow additional fields if needed
}

// Define the structure of the UserContext document
interface UserContextDocument extends Document {
  userId: string;
  apiAccessTokens?: ApiAccessTokens;
  configuration?: Configuration;
  createdAt: Date;
  updatedAt: Date;
}

// Define the schema
const UserContextSchema = new Schema<UserContextDocument>({
  userId: { type: String, required: true },
  apiAccessTokens: {
    accessToken: { type: String },
    refreshToken: { type: String },
    accessTokenExpiration: { type: Date },
    refreshTokenExpiration: { type: Date },
  },
  configuration: {
    type: Schema.Types.Mixed, // Reference the Configuration type for flexibility
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Create or reuse the model
const UserContext: Model<UserContextDocument> =
  mongoose.models.UserContext || mongoose.model('UserContext', UserContextSchema);

export default UserContext;
