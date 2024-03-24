import { useEffect } from "react"
import { CardDemo } from "./CardDemo"
import axios from "axios"


function App() {
  useEffect(()=> {
    axios.get("http://localhost:5000/api/user")
    .then(res => console.log(res))
    .catch(err=> console.log(err))

  }, [])

  return (
    <>
      <CardDemo />
      <div className="text-9xl p-3">i'm God child</div>
    </>
  )
}

export default App
