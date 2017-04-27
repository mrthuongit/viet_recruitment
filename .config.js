exports.environments = {
  development: {
      apiUrl: 'https://demo.vietinterview.com/api',
      callSocketUrl: 'wss://localhost:9451/call',
      one2oneSocketUrl: 'wss://localhost:9449/one2one',
      one2oneDirectSocketUrl: 'wss://localhost:9452/one2oneDirect',
      iceServers: [
                {
                      'url':'stun:stun.l.google.com:19302'
                    },
                   {
                     'url': 'turn:125.212.233.5:3478?transport=udp',
                     'credential': '123456',
                     'username': 'quang'
                   }
                 ],
    enabledLog:true
  },
  demo: {
      apiUrl: 'https://demo.vietinterview.com/api',
      callSocketUrl: 'wss://training.demo.vietinterview.com:9451/call',
      one2oneSocketUrl: 'wss://training.demo.vietinterview.com:9449/one2one',
      one2oneDirectSocketUrl: 'wss://training.demo.vietinterview.com:9452/one2oneDirect',
      iceServers: [
                  {
                      'url':'stun:stun.l.google.com:19302'
                    },
                   {
                     'url': 'turn:125.212.233.5:3478?transport=udp',
                     'credential': '123456',
                     'username': 'quang'
                   }
                 ],
      enabledLog:true
    },
  demo_saison: {
        apiUrl: 'https://demo.vietinterview.com/api',
        callSocketUrl: 'wss://training.demo.vietinterview.com:9451/call',
        one2oneSocketUrl: 'wss://training.demo.vietinterview.com:9449/one2one',
        one2oneDirectSocketUrl: 'wss://training.demo.vietinterview.com:9452/one2oneDirect',
        iceServers: [
                     {
                       'url': 'turn:125.212.233.5:3478?transport=udp',
                       'credential': '123456',
                       'username': 'quang'
                     }
                   ],
        enabledLog:true
      },
  demo_homecredit: {
      apiUrl: 'https://demo.vietinterview.com/api',
      callSocketUrl: 'wss://training.demo.vietinterview.com:9451/call',
      one2oneSocketUrl: 'wss://training.demo.vietinterview.com:9449/one2one',
      one2oneDirectSocketUrl: 'wss://training.demo.vietinterview.com:9452/one2oneDirect',
      iceServers: [
                   {
                     'url': 'turn:125.212.233.5:3478?transport=udp',
                     'credential': '123456',
                     'username': 'quang'
                   }
                 ],
      enabledLog:true
    },
  production: {
      apiUrl: 'https://vietinterview.com/api',
      callSocketUrl: 'wss://training.demo.vietinterview.com:9451/call',
      one2oneSocketUrl: 'wss://training.demo.vietinterview.com:9449/one2one',
      one2oneDirectSocketUrl: 'wss://training.demo.vietinterview.com:9452/one2oneDirect',
      iceServers: [
                    {
                      'url':'stun:stun.l.google.com:19302'
                    },
                   {
                     'url': 'turn:125.212.233.5:3478?transport=udp',
                     'credential': '123456',
                     'username': 'quang'
                   }
                 ],
      enabledLog:false
  }
};