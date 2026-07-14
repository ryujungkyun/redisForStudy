// listpack : Redis 7.0 이전에는 ziplist
// listpack은 작은 메모장으로 생각하면 된다 
// 작은 메모장이기 떄문에 조회 성능 O(n) 이지만 필드값이 작아서 괜찮다 
// 1. Hash 필드 개수가 hash-max-listpack-entries 보다 작거나 같고 (512)
// 2. 모든 필드 이름과 값의 크기가 hash-max-listpack-value (64)

// hashtable

//이렇게 name, email, age를 하나의 key에 묶어서 관리할 수 있다
// 해당 메타 데이터를 써야하기 떄문에 비효율적일 수 있다
// "user:1000:name", "user:1000:email", "user:1000:age"

// 이렇게 따로 하나의 해쉬만 만드는것이 하나의 메타 데이터만 필요함으로 유리할 수 있다.
// "user:1000"


/*
    1. HSET : HSET key field value [field value ...]
        -> key : hash 이름, field : 필드 이름, value : 설정할 값
        -> HSET user:1000 name alice
        -> HSET user:1000 name Alice email alice@example.com age 25
        -> HSET 여러개 사용하는것은 redis 4.0 이상에서만 가능하다 반환값은 설정된 필드의 개수이다
        -> HMSET : HMSET key field value [field value ...]  -> redis 4.0 이상에서 -> HMSET은 HSET으로 대체되었다 대신 성공하면 OK를 반환한다

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
        -> key : hash 이름, field : 필드 이름
        -> HEXISTS user:1000 name -> 1, HEXISTS user:1000 phone -> 0

    user:1000

    name  -> Alice
    email -> alice@example.com
    age   -> 25

    6. HKEY : HKEYS key
    -> 순서보장 x 사용 케이스 없음 
    -> HKEYS user:1000 -> [name, email, age]

    7. HVALS : HVALS key 
    -> 순서보장 x 사용 케이스 없음 
    -> HVALS user:1000 -> [Alice, alice@example.com, 25]

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