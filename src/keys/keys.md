1. KEYS pattern
    -> KEYS *
    -> KEYS user:* -> user:a, user:b, user:test:1
    -> KEYS user:[123]* -> user:1, user:2, user:3
    -> KEYS user:[a-z]* -> user: 다음에 오는 소문자 알파벳
    -> KEYS user:/* -> user:*라는 iteral문자열을 가진 key

2. SCAN cursor [pattern] [count] [type]
    -> SCAN 0 : [17, [key1, key2, key3]]
    -> SCAN 17 : ~~
    -> SCAN <> : [0, [key10, key11]]

3. EXISTS key [key ...]
    -> EXISTS user:1000
    -> EXISTS user:1000 user:2000
    -> EXISTS mykey mykey mykey