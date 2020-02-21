// export interface Attributes {
//   type: string;
//   url: string;
// }

export interface Id {
  subscriberPackageVersionId: string;
}
export interface Dependencies {
  ids: Id[];
}
export interface SubscriberPackageVersion {
  //  attributes: Attributes;
  Dependencies: Dependencies;
}

export interface Package2 {
  //  attributes?: Attributes;
  Name: string;
  NamespacePrefix?: string;
}

export interface Package2Version {
  Package2?: Package2;
  SubscriberPackageVersionId?: string;
  MajorVersion?: number;
  MinorVersion?: number;
  PatchVersion?: number;
  BuildNumber?: number;
  Tag?: string;
  Branch?: string;
  IsReleased?: boolean;
  IsPasswordProtected?: boolean;
  //  attributes?: Attributes;
  //  Id?: string;
  //  Package2Id?: string;
  //  Name?: string;
  //  Description?: string;
  //  CreatedDate?: string;
  //  LasteModifiedDate?: string;
}
