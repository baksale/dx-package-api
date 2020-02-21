import { Connection } from '@salesforce/core';
import { DxPackageMetadataApi } from './api';
import { DxPackageMetadataApiImpl } from './apimpl';
import { Package2Version } from './model';

export interface DxPackageMetadataCachingApi {
  getPackage2VersionById(subscriberPackageVersionId: string): Promise<Package2Version>;
  getDependencies(subscriberPackageVersionId: string): Promise<Package2Version[]>;
}

export class DxPackageMetadataCachingApiImpl implements DxPackageMetadataCachingApi {
  private packageVersions: Map<string, Package2Version> = new Map();
  private packageVersionIdToDependenciesIds: Map<string, string[]> = new Map();
  private dxPackageMetadataApi: DxPackageMetadataApi;

  constructor(connection: Connection) {
    this.dxPackageMetadataApi = new DxPackageMetadataApiImpl(connection);
  }

  public async getPackage2VersionById(subscriberPackageVersionId: string): Promise<Package2Version> {
    if (!this.packageVersions.has(subscriberPackageVersionId)) {
      this.packageVersions.set(
        subscriberPackageVersionId,
        await this.dxPackageMetadataApi.getPackage2VersionById(subscriberPackageVersionId)
      );
    }
    return this.packageVersions.get(subscriberPackageVersionId);
  }
  public async getDependencies(subscriberPackageVersionId: string): Promise<Package2Version[]> {
    const result: Package2Version[] = [];
    if (!this.packageVersionIdToDependenciesIds.has(subscriberPackageVersionId)) {
      this.packageVersionIdToDependenciesIds.set(
        subscriberPackageVersionId,
        await this.dxPackageMetadataApi.getDependenciesIds(subscriberPackageVersionId)
      );
    }
    const ids = this.packageVersionIdToDependenciesIds.get(subscriberPackageVersionId);
    if (ids.length === 0) return result;
    const missingPackageIds: string[] = [];
    ids.forEach(id => {
      if (!this.packageVersions.has(id)) missingPackageIds.push("'" + id + "'");
      else result.push(this.packageVersions.get(id));
    });
    if (missingPackageIds.length === 0) return result;
    const packageVersions = await this.dxPackageMetadataApi.getPackage2VersionByIds(missingPackageIds);
    packageVersions.forEach(packageVersion => {
      result.push(packageVersion);
      this.packageVersions.set(packageVersion.SubscriberPackageVersionId, packageVersion);
    });
    return result;
  }
}
