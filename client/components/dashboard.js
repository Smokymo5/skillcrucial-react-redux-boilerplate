import React from 'react'
import { Link } from 'react-router-dom'
import Head from './head'

const Dashboard = () => {
  return (
    <div>
      <Head title="Hello" />
      <div className="flex items-center justify-center h-screen">
        <div className="bg-indigo-800 hover:text-red-500 text-white font-bold rounded-lg border shadow-lg p-10">
          <div id="title">
            Dashboard
            <div>
              <Link to="/dashboard/profile/b32f67d5-107c-465b-b6af-ae8194b0e805">
                {' '}
                Go to Profile{' '}
              </Link>
            </div>
            <div>
              <Link to="/dashboard/main"> Go to Main </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

Dashboard.propTypes = {}

export default React.memo(Dashboard)
