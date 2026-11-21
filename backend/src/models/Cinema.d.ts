import { Document, Model } from "mongoose";
export interface ICinema extends Document {
    name: string;
    bundleSizes: number[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const Cinema: Model<ICinema>;
//# sourceMappingURL=Cinema.d.ts.map