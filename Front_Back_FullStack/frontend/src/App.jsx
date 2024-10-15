import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [jokes, setJokes] = useState([])

  useEffect(() => {
     axios.get('/api/jokes')
      .then((response) => {
         setJokes(response.data)
      })
      .catch((error) => {
         console.log(error);
      })
  })

  return (
    <>
      <h1>Krushna with backend and frotend</h1>
      <h1>Jokes : {jokes.length}</h1>

      {
        jokes.map((joke) => (
           <div key={joke.id}>
             <p>{joke.title}</p>
             <p>{joke.name}</p>
           </div>
        ))
      }
    </>
  )
}

export default App
