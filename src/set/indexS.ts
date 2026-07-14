import { createRedisClient, disconnectRedisClient } from "../connection";

async function main() {
   const client = createRedisClient();

   try {
    
    await client.sadd('fruits', 'apple');
    await client.sadd('fruits', 'apple');
    await client.sadd('fruits', 'banana', 'orange');
    
    const allFruits = await client.smembers('fruits');
    console.log('All fruits in the set:', allFruits);

    const isAppleMember = await client.sismember('fruits', 'apple');
    console.log('Is apple a member of the set?', isAppleMember === 1 ? 'Yes' : 'No');

    const isGrapeMember = await client.sismember('fruits', 'grape');
    console.log('Is grape a member of the set?', isGrapeMember === 1 ? 'Yes' : 'No');

    const size = await client.scard('fruits');
    console.log('Number of fruits in the set:', size);

    await client.srem('fruits', 'appple');
    
    const afterRemove = await client.smembers('fruits');
    console.log('Fruits in the set after removing apple:', afterRemove);
    
    const poppedFruit = await client.spop('fruits');
    console.log('Popped fruit from the set:', poppedFruit);

    const afterPop = await client.smembers('fruits');
    console.log('Fruits in the set after popping one:', afterPop);

    // ------------------------------

    await client.sadd('numbers', '1', '2', '3', '4', '5');
    //Set 안에 있는 값을 삭제하지 않고 랜덤하게 꺼내서 보여줘 ('nubmers)
    const random = await client.srandmember('numbers', 2);
    console.log('Two random members from numbers set:', random);

    const randomMultiple = await client.srandmember('numbers', 3);
    console.log('Three random members from numbers set:', randomMultiple);
    
    // ------------------------------ 실용 예시 : 게시글 좋아요 시스템

    await client.sadd('post:1:likes', 'user1', 'user2', 'user3');
    //Set + Cardinality  Cardinality는 “원소가 몇 개 있는가”
    const likesCount = await client.scard('post:1:likes');
   } finally {
      await disconnectRedisClient(client);
   }
}

main();