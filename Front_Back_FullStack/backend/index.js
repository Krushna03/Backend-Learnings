import express from 'express'

const app = express()

app.get('/', (req, res) => {
   res.send('Server is started')
})

app.get('/api/jokes', (req, res) => {
  const jokes = [
    {
      id: 1,
      title: "Skeleton Fight",
      name: "Why don't skeletons fight each other? They don't have the guts!"
    },
    {
      id: 2,
      title: "Scarecrow Award",
      name: "Why did the scarecrow win an award? Because he was outstanding in his field!"
    },
    {
      id: 3,
      title: "Fake Spaghetti",
      name: "What do you call fake spaghetti? An impasta!"
    },
    {
      id: 4,
      title: "Egg Jokes",
      name: "Why don't eggs tell jokes? They might crack up!"
    },
    {
      id: 5,
      title: "Grape Reaction",
      name: "What did the grape do when it got stepped on? Nothing, it just let out a little wine!"
    }
  ];  
   res.send(jokes)
})

const port = process.env.PORT || 3000;

app.listen(port, () => {
   console.log('Server is running on ' + port );
}) 