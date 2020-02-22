import { Connection } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import { Package2Version, SubscriberPackageVersion } from '.';
import { DxPackageMetadataApi } from './api';

export class DxPackageMetadataApiImpl implements DxPackageMetadataApi {
  private PACKAGE_VERSION_QUERY =
    'SELECT Id, SubscriberPackageVersionId, Package2.Name, Package2.NamespacePrefix' +
    ',Tag, Branch, MajorVersion, MinorVersion, PatchVersion, BuildNumber' +
    ',IsReleased, IsPasswordProtected ' +
    'FROM Package2Version ';

  private PACKAGE_VERSION_WHERE_BY_IDS = ' where SubscriberPackageVersionId in (%s) ';

  private PACKAGE_VERSION_WHERE_BY_VERSION =
    " WHERE Package2Id='%i' AND MajorVersion=%m AND MinorVersion=%n AND PatchVersion=%p AND BuildNumber=%b";

  private PACKAGE_VERSION_DEPENDENCIES_QUERY = "SELECT Dependencies FROM SubscriberPackageVersion WHERE Id = '%s'";

  private MAX_BUILD_NUMBER_QUERY =
    'SELECT max(buildNumber) latestBuildNumber FROM Package2Version' +
    " WHERE Package2Id='%i' AND MajorVersion=%m AND MinorVersion=%n AND PatchVersion=%p";
  constructor(private connection: Connection) {}

  public async getMaxBuildNumber(
    package2Id: string,
    majorVersion: string,
    minorVersion: string,
    patchVersion: string
  ): Promise<number> {
    let maxBuildVersion: number = -1;
    const query: string = this.MAX_BUILD_NUMBER_QUERY.replace('%i', package2Id)
      .replace('%m', majorVersion)
      .replace('%n', minorVersion)
      .replace('%p', patchVersion);
    await this.connection.tooling.query<AnyJson>(query).then(maxBuildVersionQueryResult => {
      maxBuildVersionQueryResult.records.some(maxBuildVersionElement => {
        // tslint:disable-next-line: no-string-literal
        maxBuildVersion = maxBuildVersionElement['latestBuildNumber'];
        return true;
      });
    });
    return maxBuildVersion;
  }
  public async getPackage2VersionById(subscriberPackageVersionId: string): Promise<Package2Version> {
    const query: string = (this.PACKAGE_VERSION_QUERY + this.PACKAGE_VERSION_WHERE_BY_IDS).replace(
      '%s',
      subscriberPackageVersionId
    );
    let result: Package2Version = null;
    await this.connection.tooling.query<Package2Version>(query).then(packageQueryResult => {
      packageQueryResult.records.forEach(packageVersion => {
        result = packageVersion;
        return true;
      });
    });
    return result;
  }
  public async getPackage2VersionByVersion(
    package2Id: string,
    majorVersion: string,
    minorVersion: string,
    patchVersion: string,
    buildNumber: string
  ): Promise<Package2Version> {
    const query: string = (this.PACKAGE_VERSION_QUERY + this.PACKAGE_VERSION_WHERE_BY_VERSION)
      .replace('%i', package2Id)
      .replace('%m', majorVersion)
      .replace('%n', minorVersion)
      .replace('%p', patchVersion)
      .replace('%b', buildNumber);
    let result: Package2Version = null;
    await this.connection.tooling.query<Package2Version>(query).then(packageQueryResult => {
      packageQueryResult.records.forEach(packageVersion => {
        result = packageVersion;
        return true;
      });
    });
    return result;
  }
  public async getPackage2VersionByIds(subscriberPackageVersionIds: string[]): Promise<Package2Version[]> {
    const result: Package2Version[] = [];
    if (subscriberPackageVersionIds.length === 0) return result;
    const packageWhereClause = this.PACKAGE_VERSION_WHERE_BY_IDS.replace('%s', subscriberPackageVersionIds.join(','));
    const query = this.PACKAGE_VERSION_QUERY + packageWhereClause;
    await this.connection.tooling.query<Package2Version>(query).then(packageQueryResult => {
      packageQueryResult.records.forEach(packageVersion => {
        result.push(packageVersion);
      });
    });
    return result;
  }
  public async getDependenciesIds(subscriberPackageVersionId: string): Promise<string[]> {
    const result: string[] = [];
    const query = this.PACKAGE_VERSION_DEPENDENCIES_QUERY.replace('%s', subscriberPackageVersionId);
    await this.connection.tooling.query<SubscriberPackageVersion>(query).then(subscriberPackageVersion => {
      subscriberPackageVersion.records.forEach(packageVersion => {
        if (packageVersion.Dependencies) {
          packageVersion.Dependencies.ids.forEach(id => {
            result.push(id.subscriberPackageVersionId);
          });
        }
      });
    });
    return result;
  }
}
