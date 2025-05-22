import express from "express";
import request from "supertest";
import { uploadImageHandler } from "./upload-image.handler";
import { ImageStatusEnum } from "../../domain/enums/image-status.enum";
import { InMemoryStorageAdapter } from "../../common/file-storage/adapters/file-storage.in-memory";
import { ImagesMemoryRepository } from "../../repositories/images/memory.repository";
import { storageRepository } from "../../common/file-storage/repository";
import { imagesRepository } from "../../repositories/images/repository";
import { STATUS_CODES } from "http";


const uuidMock = "uuidMock"
jest.mock("uuid", () => ({ v4: () => uuidMock }));


describe("upload file handler", () => {
	let app: express.Express;

	beforeAll(() => {
		app = express();
		app.post("/upload", uploadImageHandler);
	});

	beforeEach(() => {
		if (storageRepository instanceof InMemoryStorageAdapter) {
			storageRepository.reset()
		}
		if (imagesRepository instanceof ImagesMemoryRepository) {
			imagesRepository.reset()
		}
		jest.clearAllMocks();
		jest.restoreAllMocks();
	})

	it("should upload a file and return the fileId (in-memory)", async () => {
		const buffer = Buffer.from("conteúdo de teste da imagem", "utf-8");

		const response = await request(app)
			.post("/upload")
			.attach("file",
				buffer,
				{
					filename: "test.jpg",
					contentType: "image/jpeg",
				}
			)

		expect(response.status).toBe(202);
		expect(response.body).toEqual({
			fileId: uuidMock
		});
	});

	it("should store the image metadata on the database (in-memory)", async () => {
		const buffer = Buffer.from("conteúdo de teste da imagem", "utf-8");

		await request(app)
			.post("/upload")
			.attach("file",
				buffer,
				{
					filename: "test.jpg",
					contentType: "image/jpeg",
				}
			)

		const [imageMetadata] = await imagesRepository.list()

		expect(imageMetadata.taskId).toBe(uuidMock)
		expect(imageMetadata.originalFilename).toBe("test.jpg")
		expect(imageMetadata.originalMetadata?.mimetype).toBe("image/jpeg")
		expect(imageMetadata.status).toBe(ImageStatusEnum.PENDING)
	});


	it("should store the image bytes on the storage repository (in-memory)", async () => {

		// should trow becuse its empty
		expect(() => storageRepository.downloadFile(uuidMock)).toThrow()

		const buffer = Buffer.from("conteúdo de teste da imagem", "utf-8");
		await request(app)
			.post("/upload")
			.attach("file",
				buffer,
				{
					filename: "test.jpg",
					contentType: "image/jpeg",
				}
			)

		// should not throw now
		expect(storageRepository.downloadFile(uuidMock)).toBeTruthy()
		// should throw because the uuid is invalid
		expect(() => storageRepository.downloadFile("invalidUuid")).toThrow()
	});


	it("should throw a 500 exception if an error occurs in the storage layer", async () => {

		const errorMessage = "something went wrong"

		jest.spyOn(storageRepository, "sendFile").mockImplementation(() => {
			throw new Error(errorMessage)
		})

		const buffer = Buffer.from("conteúdo de teste da imagem", "utf-8");

		const res = await request(app)
			.post("/upload")
			.attach("file",
				buffer,
				{
					filename: "test.jpg",
					contentType: "image/jpeg",
				}
			)

		expect({
			status: res.status,
			body: res.body
		}).toEqual({
			status: 500,
			body: {
				message: errorMessage,
				statusCode: 500,
				error: STATUS_CODES[500]
			}
		})
	});

	it("should throw a 500 exception if an error occurs in the database layer", async () => {

		const errorMessage = "cannot access database"

		jest.spyOn(imagesRepository, "insert").mockImplementation(() => {
			throw new Error(errorMessage)
		})

		const buffer = Buffer.from("conteúdo de teste da imagem", "utf-8");

		const res = await request(app)
			.post("/upload")
			.attach("file",
				buffer,
				{
					filename: "test.jpg",
					contentType: "image/jpeg",
				}
			)

		expect({
			status: res.status,
			body: res.body
		}).toEqual({
			status: 500,
			body: {
				message: errorMessage,
				statusCode: 500,
				error: STATUS_CODES[500]
			}
		})
	});
});
