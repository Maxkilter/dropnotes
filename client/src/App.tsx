import React from 'react';
import  { BrowserRouter as Router } from 'react-router-dom';
import Navbar from './components/Navbar';
import navigation from './routes';

import './App.css';


const App = () => {
	const routes = navigation(false);
	return	(
		<>
			<Router>
				<Navbar isAuthenticated />
				{routes}
			</Router>
		</>
	);
};

export default App;
