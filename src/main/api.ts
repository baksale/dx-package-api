import { Package2Version } from "./model";

export interface DxPackageMetadataApi {
  getMaxBuildNumber(package2Id: string, majorVersion: string, minorVersion: string, patchVersion: string): Promise<number>;

  getPackage2VersionById(subscriberPackageVersionId: string): Promise<Package2Version>;
  getPackage2VersionByVersion(package2Id: string, majorVersion: string, minorVersion: string, patchVersion: string, buildNumber: string): Promise<Package2Version>;
  getPackage2VersionByIds(subscriberPackageVersionIds: string[]): Promise<Package2Version[]>;

  getDependenciesIds(subscriberPackageVersionId: string): Promise<string[]>;
}
