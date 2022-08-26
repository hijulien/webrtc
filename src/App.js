import React, { useState, useRef, useEffect } from 'react';
import Peer from 'peerjs';
// import robot from 'robotjs-browser'
import './App.css';

const App = () => {

  const [data, setData] = useState({
    myId: '',
    friendId: '',
    peer: {},
    message: '',
    messages: []
  })

  const [flag, setFlag] = useState(0);

  const local = useRef();
  const remote = useRef();

  // peer.on('close', () => {
  //   console.log("对方已挂断");
  // })


  const send = () => {
    const conn = data.peer.connect(data.friendId);
    conn.on('open', () => {
      const msgObj = {
        sender: data.myId,
        message: data.message
      };
      console.log(data);
      conn.send(msgObj);
      setData({
        ...data,
        messages: [...data.messages, msgObj],
        message: ''
      });
    });
  }

  const videoCall = () => {
    navigator.mediaDevices.getDisplayMedia({
      video: {
        cursor: "always"
      },
      audio: false
    })
      .then(localStream => {
        local.current.srcObject = localStream;
        const call = data.peer.call(data.friendId, localStream);
        console.log("localStream" + localStream);
        call.on('stream', (remoteStream) => {
          remote.current.srcObject = remoteStream;
          console.log("remoteStream" + remoteStream);
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  useEffect(() => {
    const peer = new Peer('yanyan', {
      host: '124.222.249.224',
      port: '9000',
      path: '/myapp'
    });

    peer.on('open', (id) => {
      console.log("open");
      setData(data => {
        return {
          ...data,
          myId: id,
          peer: peer
        }
      });
    });

    peer.on('connection', (conn) => {
      console.log("connection");
      setFlag(flag + 1)
      conn.on('data', (msg) => {
        setData(data => {
          return {
            ...data,
            messages: [...data.messages, msg]
          }
        });
      });
    });

    peer.on('call', (call) => {
      console.log("call");
      navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always"
        },
        audio: false
      })
        .then(localStream => {
          local.current.srcObject = localStream;
          call.answer(localStream);
          call.on('stream', (remoteStream) => {
            remote.current.srcObject = remoteStream;
          });
        })
    });
  }, [])

  // useEffect(() => {
  //   console.log(data);
  // },[data.messages])

  // useEffect(() => {
  //   console.log(data);
  // }, [data])

  return (
    <>
      <div className='box'>
        <video width={700} autoPlay playsInline ref={local} />
        <video width={700} autoPlay playsInline ref={remote} />
      </div>
      <div className="col">
        <p>本地ID: {data.myId}</p>
        <label>远程ID:</label>
        <input
          type="text"
          value={data.friendId}
          onChange={e => {
            setData({
              ...data,
              friendId: e.target.value
            });
          }} />
        <br></br>
        <label>消 息:</label>
        <input
          type="text"
          value={data.message}
          onChange={e => {
            setData({
              ...data,
              message: e.target.value
            })
          }} />
        <button onClick={send}>发送</button>

        <button onClick={videoCall}>视频电话</button>
        {
          data.messages
            ?
            data.messages.map((message, i) => {
              return (
                <div key={`mes${i}`}>
                  <h3>{message.sender} : {message.message}</h3>
                </div>
              )
            })
            :
            <></>
        }
      </div>
    </>
  );
}

export default App;
