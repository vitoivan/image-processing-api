import Stream from "stream";

export interface FileStoragePort {
	sendFile(fileStream: Stream.Readable, filename: string): Promise<void>
	downloadFile(filename: string): Stream.Readable
}
