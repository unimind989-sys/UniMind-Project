import {
  runDeterministicProviderCase,
  type DeterministicProviderCaseId,
} from "../../testing/deterministic-provider.mock";
import type { ProviderCallContext } from "../../../types/provider";
import type {
  DeleteObjectRequest,
  DeletedObject,
  GetObjectRequest,
  ObjectStorageProvider,
  PutObjectRequest,
  RetrievedObject,
  StoredObject,
} from "../object-storage-provider";

export class DeterministicMockObjectStorageProvider implements ObjectStorageProvider {
  constructor(
    private readonly caseId: DeterministicProviderCaseId = "success",
  ) {}

  async putObject(request: PutObjectRequest, context: ProviderCallContext) {
    const digest = await crypto.subtle.digest(
      "SHA-256",
      request.bytes.slice().buffer,
    );
    const checksum = Array.from(new Uint8Array(digest), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    const value: StoredObject = {
      namespace: request.namespace,
      objectKey: request.objectKey,
      checksum: `sha256:${checksum}`,
      byteLength: request.bytes.byteLength,
    };
    return this.run(context, value);
  }

  getObject(request: GetObjectRequest, context: ProviderCallContext) {
    const value: RetrievedObject = {
      namespace: request.namespace,
      objectKey: request.objectKey,
      checksum: "synthetic-checksum",
      byteLength: 3,
      bytes: new Uint8Array([115, 121, 110]),
      contentType: "application/octet-stream",
    };
    return this.run(context, value);
  }

  deleteObject(request: DeleteObjectRequest, context: ProviderCallContext) {
    const value: DeletedObject = {
      namespace: request.namespace,
      objectKey: request.objectKey,
      absent: true,
    };
    return this.run(context, value);
  }

  private run<T>(context: ProviderCallContext, successValue: T) {
    return runDeterministicProviderCase(context, {
      caseId: this.caseId,
      provider: "mock-object-storage-provider",
      configVersion: "mock-v1",
      unit: "bytes",
      successValue,
    });
  }
}
