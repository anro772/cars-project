import { createStore } from 'vuex';

export default createStore({
    state: {
        isAuthenticated: false,
        authToken: null,
    },
    mutations: {
        setAuth(state, { token, isAuthenticated }) {
            state.isAuthenticated = isAuthenticated;
            state.authToken = token;
        },
    },
    actions: {
        login({ commit }, token) {
            localStorage.setItem('userToken', token); // Store token in local storage
            commit('setAuth', { token, isAuthenticated: true });
        },
        logout({ commit }) {
            localStorage.removeItem('userToken'); // Remove token from local storage
            commit('setAuth', { token: null, isAuthenticated: false });
        },
        initializeStore({ commit }) {
            const token = localStorage.getItem('userToken');
            if (token) {
                fetch('http://localhost:3000/validate-token', {
                    method: 'GET',
                    headers: { 'Authorization': `Bearer ${token}` },
                })
                    .then(response => {
                        if (response.ok) {
                            commit('setAuth', { token, isAuthenticated: true });
                        } else {
                            throw new Error('Token validation failed');
                        }
                    })
                    .catch(error => {
                        console.error('Token validation error:', error);
                        localStorage.removeItem('userToken'); // Clear the token as it's invalid
                        commit('setAuth', { token: null, isAuthenticated: false });
                    });
            } else {
                commit('setAuth', { token: null, isAuthenticated: false });
            }
        }
    },
    getters: {
        isAuthenticated(state) {
            return state.isAuthenticated;
        }
    }
});
