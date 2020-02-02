import React, {useEffect, useState} from 'react';
import ReactDOM from 'react-dom';
import {SapphireDb} from 'sapphiredb';
import {filter, map, switchMap, take} from "rxjs/operators";
import {combineLatest, ReplaySubject} from "rxjs";

const useObservable = observable => {
    const [state, setState] = useState();

    useEffect(() => {
        const sub = observable.subscribe((v) => setState({ value: v }));
        return () => sub.unsubscribe();
    }, [observable]);

    return state;
};

const db = new SapphireDb({
    useSsl: true,
    serverBaseUrl: 'sapphiredb-demo.azurewebsites.net',
    connectionType: 'websocket'
});

const exampleCollection = db.collection('basic.examples');
const examples$ = exampleCollection.values();

const userCollection = db.collection('chat.users');
const users$ = userCollection.values();
const currentUser$ = new ReplaySubject();
const chatPartners$ = combineLatest([users$, currentUser$]).pipe(
    map(([users, currentUser]) => users.filter(u => u.id !== currentUser.id))
);

const chatPartner$ = new ReplaySubject();

const messageCollection$ = combineLatest([currentUser$, chatPartner$]).pipe(
    filter(([currentUser, chatPartner]) => !!currentUser && !!chatPartner),
    map(([currentUser, chatPartner]) => {
        return db.collection('chat.messages').where([
            [['ownerId', '==', currentUser.id], 'and', ['receiverId', '==', chatPartner.id]],
            'or',
            [['ownerId', '==', chatPartner.id], 'and', ['receiverId', '==', currentUser.id]]
        ]);
    })
);
const messages$ = messageCollection$.pipe(switchMap(c => c.values()));

function App() {
    /* Basic example */
    const examples = useObservable(examples$);

    function addExample() {
        exampleCollection.add({
            content: prompt('Content of new example:')
        });
    }

    function updateExample(example) {
        exampleCollection.update({
            ...example,
            content: prompt('New content of example:')
        });
    }

    function removeExample(example) {
        exampleCollection.remove(example);
    }

    /* Chat */
    const users = useObservable(users$);

    function createUser() {
        userCollection.add({
            username: prompt('New username: ') || 'default'
        });
    }

    const [userState, setUserState] = useState();
    let chatPartners = useObservable(chatPartners$);

    function setUser(user) {
        setUserState({ currentUser: user, chatPartner: null });
        chatPartner$.next(null);
        currentUser$.next(user);
    }

    function setChatPartner(user) {
        setUserState({ ...userState, chatPartner: user });
        chatPartner$.next(user);
    }

    const messages = useObservable(messages$);

    const [messageState, setMessageState] = useState();

    function sendMessage() {
        messageCollection$.pipe(
            take(1)
        ).subscribe(collection => {
           collection.add({
               ownerId: userState.currentUser.id,
               receiverId: userState.chatPartner.id,
               content: messageState
           });
           setMessageState('');
        });
    }

    return (
        <div className="App">
            <h1>Example React application using SapphireDb</h1>
            <h2>Basic example</h2>

            {examples?.value.map(example => (
                <div key={example.id}>
                    {JSON.stringify(example)}
                    <button onClick={() => updateExample(example)}>Update</button>
                    <button onClick={() => removeExample(example)}>Remove</button>
                </div>
            ))}

            <button onClick={addExample}>Add</button>

            <h2>Chat</h2>
            <h3>Users</h3>

            {users?.value.map(user => (
                <button key={user.id} onClick={() => setUser(user)}>{user.username}</button>
            ))}

            <button onClick={createUser}>Create user</button>

            {userState && userState.currentUser ? (
                <div>
                    <h3>You are {userState.currentUser.username}</h3>
                    <h4>Select chat partner</h4>
                    {chatPartners?.value.map(partner => (
                        <button key={partner.id} onClick={() => setChatPartner(partner)}>{partner.username}</button>
                    ))}

                    { userState.chatPartner ? (
                        <div>
                            <h3>Chat between '{userState.currentUser.username}' and '{userState.chatPartner.username}'</h3>
                            <h4>Message</h4>
                            {messages?.value.map(message => (
                                <div style={{textAlign: message.ownerId === userState.currentUser.id ? 'right' : 'left'}}>{message.content} ({message.createdOn})</div>
                            ))}
                            <label>
                                New Message:
                                <input value={messageState} onChange={(event) => setMessageState(event.target.value)} />
                            </label>
                            <button onClick={sendMessage}>Send</button>
                        </div>
                    ) : ('')}
                </div>
            ) : ('')}
        </div>
    );
}

const rootElement = document.getElementById('root');
ReactDOM.render(<App/>, rootElement);

