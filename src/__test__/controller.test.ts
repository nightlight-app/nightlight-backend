import request from 'supertest';

describe("POST /posts", () => {
    it("returns status code 201 if posted successfully", async () => {
        const response = await request('http://localhost:6060')
        .post('/posts')
        .send({title: 'Test Title', body: 'this is my body'})
        .expect(201);
    })
})
