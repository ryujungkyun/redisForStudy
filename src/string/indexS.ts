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
        console.log('Mget Values:', values);
        
        await client.set('sessions:abcd1234', 'abtice', 'EX', 300) // setex;
        const sessitonTtl = await client.ttl('sessions:abcd1234');
        console.log('Session TTL:', sessitonTtl);
        
        const first = await client.setnx('config:featureX', 'enabled'); // Not exist, so it will set the value and return 1
        console.log('First SETNX (should be 1):', first);

        const second = await client.setnx('config:featureX', 'disabled');
        console.log('Second SETNX (should be 0):', second);
        
    }catch (error) {
        console.error('Error:', error);
    } finally {
        await disconnectRedisClient(client);
    }

}

main().catch(console.error);