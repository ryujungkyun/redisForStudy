// listpack : Redis 7.0 이전에는 ziplist
// 1. Hash 필드 개수가 hash-max-listpack-entries 보다 작거나 같고 (512)
// 2. 모든 필드 이름과 값의 크기가 hash-max-listpack-value (64)

// hashtable

// "user:1000:name", "user:1000:email", "user:1000:age"
// "user:1000"


/*
    1. HSET : HSET key field value [field value ...]
        -> key : hash 이름, field : 필드 이름, value : 설정할 값
        -> HSET user:1000 name alice
        -> HSET user:1000 name Alice email alice@example.com age 25

    2. HGET : HGET key field
        -> key : hash 이름, field : 필드 이름
        -> HGET user:1000 name

    3. HMGET : HMGET key field [field ...]
        -> key : hash 이름, field : 필드 이름들
        -> HMGET user:1000 name email age -> [Alice, nil, 25]

    4. HINCRBY : HINCRBY key field increment
        -> key : hash 이름, field : 필드 이름, increment : 증가시킬 값
        -> HINCRBY user:1000 age 1
    
    5. HEXISTS : HEXISTS key field

    6. HKEY : HKEYS key

    7. HVALS : HVALS key
*/

import { createRedisClient, disconnectRedisClient } from "../connection";

async function main() {
    const client = createRedisClient();

    try {
        await client.hset('user:1000', 'name', 'Alice')
        await client.hset('user:1000', 'email', 'alice@example.com', 'age', '25')

        const name = await client.hget('user:1000', 'name');
        console.log('Name:', name); // Alice

        const age = await client.hget('user:1000', 'age');
        console.log('Age:', age); // 25

        const [name2, email, age2] = await client.hmget('user:1000', 'name', 'email', 'age');
        console.log('HMGET:', name2, email, age2);

        const allField = await client.hgetall('user:1000');
        console.log('HGETALL:', allField);

        for (const [f, v] of Object.entries(allField)) {
            console.log(`Field: ${f}, Value: ${v}`);
        }

        const hasPhone = await client.hexists('user:1000', 'phone');
        console.log('Has phone field:', hasPhone); // 0

        const keys = await client.hkeys('user:1000');
        console.log('HKEYS:', keys);

        const vals = await client.hvals('user:1000');
        console.log('HVALS:', vals);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await disconnectRedisClient(client);
    }
}

main();