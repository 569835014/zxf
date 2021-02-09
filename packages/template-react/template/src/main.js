import 'assets/style.css'
import 'assets/base.styl'
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { AppContainer } from 'react-hot-loader';
import {a} from './test'
console.info(a);
const render = Component => {
    const Content = process.env.NODE_ENV === 'dev'?( <AppContainer>
            <App />
        </AppContainer>):<App/>
    ReactDOM.render(
        // Wrap App inside AppContainer
        Content,
        document.getElementById('root')
    );
};
render(App);
if (module.hot) {
    module.hot.accept('./App', () => {
        render(App);
    });
}
