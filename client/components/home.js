import React, { useState } from 'react'
import { Switch, Route } from 'react-router-dom'
import Head from './head'
import Dashboard from './dashboard'
import Main from './main'
import Profile from './profile'

// import wave from '../assets/images/wave.jpg'

const Home = () => {
  const [counter, setCounterNew] = useState(0)

  return (
    <div>
      <Head title="Hello" />
      <img alt="wave" src="images/wave.jpg" />
      <Switch>
        <Route exact path="/dashboard" component={() => <Dashboard />} />
        <Route exact path="/dashboard/main" component={() => <Main />} />
        <Route exact path="/dashboard/profile/:user" component={() => <Profile />} />
      </Switch>
      <button type="button" onClick={() => setCounterNew(counter + 1)}>
        updateCounter
      </button>
      <div> Hello World Dashboard {counter} </div>
    </div>

  )
}

Home.propTypes = {}

export default Home