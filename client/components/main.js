import React from 'react'
import { Link } from 'react-router-dom'
import Head from './head'

const Main = () => {
  return (
    <div>
      <Head title="Hello" />
      <div className="flex items-center justify-center h-screen">
        <div className="bg-indigo-800 hover:text-red-500 text-white font-bold rounded-lg border shadow-lg p-10">
          <div id="title">
            Main
            <div>
              <Link to="/dashboard/profile/b32f67d5-107c-465b-b6af-ae8194b0e805">
                {' '}
                Go to Profile{' '}
              </Link>
            </div>
            <div>
              <Link to="/dashboard"> Go to Root </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

Main.propTypes = {}

export default React.memo(Main)
