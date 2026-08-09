import { createSlice } from '@reduxjs/toolkit'

const currencySlice = createSlice({
    name: 'currency',
    initialState: {
        code: 'USD',
        symbol: '$',
        rates: {},
        list: [],
        loading: false,
    },
    reducers: {
        setCurrency: (state, action) => {
            state.code = action.payload.code
            state.symbol = action.payload.symbol
        },
        setRates: (state, action) => {
            state.rates = action.payload
        },
        setList: (state, action) => {
            state.list = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
    }
})

export const { setCurrency, setRates, setList, setLoading } = currencySlice.actions

export default currencySlice.reducer
