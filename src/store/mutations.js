// import { SET_SINGER, SET_PLAYING, SET_FULL_SCREEN, SET_PLAT_LIST, SET_SEQUENCE_LIST, SET_CURRENT_INDEX, SET_MODE } from './mutationTypes'

const mutations = {
    SET_SINGER (state, singer) {
        state.singer = singer
    },
    SET_PLAYING (state, flag) {
        state.playing = flag
    },
    SET_FULL_SCREEN (state, flag) {
        state.fullScreen = flag
    },
    SET_PLAT_LIST (state, list) {
        state.playList = list
    },
    SET_SEQUENCE_LIST (state, list) {
        state.sequenceList = list
    },
    SET_CURRENT_INDEX (state, index) {
        state.currentIndex = index
    },
    SET_MODE (state, mode) {
        state.mode = mode
    },
    SET_CURRENT_DESC (state, desc) {
        state.desc = desc
    },
    SET_TOP_LIST (state, topList) {
        state.topList = topList
    },
    SET_SEARCH_HISTORY(state, history) {
        state.searchHistory = history
    },
    SET_PLAY_HISTORY(state, history) {
        state.playHistory = history
    },
    SET_LOVE_LIST(state, list) {
        state.loveList = list
    }
}

export default mutations