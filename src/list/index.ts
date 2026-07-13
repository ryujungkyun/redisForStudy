// 요소가 적다?? : 각 요소의 크기가 작다 -> ziplist
// 요소가 많거나, 크기 자체가 클 떄, -> linkedlist

// 7.0 -> quicklist = ziplist + linkedlist

/*
    1. LPUSH : LPUSH key value, LPUSH key value1 value2 ...
        -> value2 value1

    2. RPUSH : RPUSH key value, RPUSH key value1 value2 ...
        -> value1 value2
  
    3. LPOP : LPOP key, LPOP key count    -> Redis 6.2버전

    4. RPOP : RPOP key, RPOP key count    -> Redis 6.2버전

    5. LRANGE : LRANGE key start stop
        -> LRANGE myulist 0 -1 : 처음부터 끝까지 모든 요소가 반환

    6. LLEN : LLEN key

    7. LINDEX : LINDEX key index
        -> index가 음수일 경우, 뒤에서부터 셈

    8. BLPOP, BRPOP : 블로킹 버전의 POP
        -> List가 비여있을 떄, 즉시 nil 반환하는게 아니라, 대신 요소가 추가될 떄까지 대기
        -> BLPOP queue 0 -> queue에 요소가 있다면 즉시 반환, 비어있다?? 그러면 무한정 대기
        -> BLPOP queue1 queue2 0
*/

import { createRedisClient, disconnectRedisClient } from "../connection";

async function main() {
    const client = createRedisClient();

    try {
        await client.rpush('mylist', 'first');
        await client.rpush('mylist', 'second', 'third');

        const list1 = await client.lrange('mylist', 0, -1);
        console.log('List Length:', list1.length);
        console.log('List Elements:', list1);

        await client.lpush('mylist', 'zero');
        const list2 = await client.lrange('mylist', 0, -1);
        console.log('After LPUSH, List Elements:', list2);

        const firstElement = await client.lpop('mylist');
        console.log('LPOP Element:', firstElement);

        const list3 = await client.lrange('mylist', 0, -1);
        console.log('After LPOP, List Elements:', list3);

        const lastElement = await client.rpop('mylist');
        console.log('RPOP Element:', lastElement);

        const list4 = await client.lrange('mylist', 0, -1);
        console.log('After RPOP, List Elements:', list4);

        const multiItems = await client.lpop('mylist', 2); // 여러 개 한번에 제거 (Redis 6.2 이상)
        console.log('LPOP Multiple Elements:', multiItems);

        const finalList = await client.lrange('mylist', 0, -1);
        console.log('Final List Elements:', finalList);


        // Queue: RPUSH추가, LPOP제거 -> FIFO
        await client.del('task_queue');
        await client.rpush('task_queue', 'task1', 'task2', 'task3');

        const task1 = await client.lpop('task_queue');
        console.log('Processing:', task1);

        const task2 = await client.lpop('task_queue');
        console.log('Processing:', task2);

        const remainingTasks = await client.lrange('task_queue', 0, -1);
        console.log('Remaining Tasks in Queue:', remainingTasks);

        // Stack: LPUSH추가, LPOP제거 -> LIFO
        // TODO

        // Blocking POP
        await client.del('async_queue');

        setTimeout(async () => {
            await client.rpush('async_queue', 'async_task1');
            console.log('Added async_task1 to async_queue');
        }, 3000)

        const producerClient = createRedisClient();

        const result = await producerClient.blpop('async_queue', 5); // 블로킹 대기 5초
        if (result) {
            console.log('BLPOP Result:', result);
        } else {
            console.log('BLPOP timed out without receiving any item.');
        }

        disconnectRedisClient(producerClient);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await disconnectRedisClient(client);
    }
}

main();