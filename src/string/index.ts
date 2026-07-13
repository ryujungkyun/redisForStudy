/*
    1. 최대 크기는 512MB
        -> 5억 3천만 글자

    {
        "id": 123456,
        "name": "홍길동",
        "email": "hong@test.com",
        "age": 30,
        "createdAt": "2026-01-01T12:00:00Z"
    } -> 150 바이트 -> 약 3.5백만개
*/

/*
    1. SDS
    -> SET count 123 -> 내부적으로 "123"이 아니라, 정수 123이 저장
    
    - int: Redis 객체 헤더(16바이트) + 정수값(8바이트) = 약 24바이트
    - embstr: Redis 객체와 SDS를 합쳐서 약 20바이트 + 문자열 길이
    - raw: Redis 객체(16바이트) + SDS 헤더(8바이트) + 문자열 길이 + 여유 공간

    --> "hello" (5바이트)
        -> embstr로 저장 : 약 25바이트
        -> raw : 30바이트
*/

/*
    1. SET : "SET users:1000:name 김철수"

    2. INCRBY : "INCRBY users:1000:visits 5"

    3. MSET : "MSET users:1000:name "김철수" users:1000:email "hong@test.com"

    4. MGET : "MGET users:1000:name users:1000:email users:1000:age"

    5. SETEX : "SETEX sessions:abcd1234 3600 "session_data""
*/


import { createRedisClient, disconnectRedisClient } from "../connection";

async function main() {
    const client = createRedisClient();

    try {

        await client.set('user:100:name', '김철수');
        const name = await client.get('user:100:name');
        console.log('Name:', name);

        await client.set('user:100:name', "이영희");
        const updatedName = await client.get('user:100:name');
        console.log('Updated Name:', updatedName);

        const none = await client.get('user:200:name');
        console.log('Non-existing Name:', none);

        await client.incr('page_views');
        await client.incr('page_views');
        await client.incr('page_views');

        const pageViews = await client.get('page_views');
        console.log('Page Views:', pageViews);

        await client.incrby('page_views', 10);
        const updatedPageViews = await client.get('page_views');
        console.log('Updated Page Views:', updatedPageViews);

        await client.decrby('page_views', 5);
        const decrementedPageViews = await client.get('page_views');
        console.log('Decremented Page Views:', decrementedPageViews);

        await client.mset(
            'user:101:name', '박민수',
            'user:101:email', 'park@test.com'
        );

        const values = await client.mget('user:101:name', 'user:101:email');
        console.log('MGET Values:', values);


        await client.set('sessiont:abc', 'abtice', 'EX', 300) // setex
        const sessionTtl = await client.ttl('sessiont:abc');
        console.log('Session TTL (seconds):', sessionTtl);

        const first = await client.setnx('config:featureX', 'enabled');
        console.log('First SETNX (should be 1):', first);

        const second = await client.setnx('config:featureX', 'disabled');
        console.log('Second SETNX (should be 0):', second);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await disconnectRedisClient(client);
    }
}

main();