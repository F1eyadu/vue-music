import { mapGetters, mapActions} from 'vuex'
import {playMode } from '@/assets/js/config'
export const playlistMixin = {
    computed: {
        ...mapGetters([
            'playList'
        ])
    },
    mounted() {
        this.handlePlayList(this.playList)
    },
    activated() {
        this.handlePlayList(this.playList)
    },
    watch: {
        playList (newVal) {
            this.handlePlayList(newVal)
        }  
    },
    methods: {
        handlePlayList() {
            throw new Error('component must important handlePlaylist method')
        }
    }
}

export const searchMixin = {
    data() {
        return {
            query: '',
            refreshDelay: 120
        }
    },
    computed: {
        ...mapGetters([
            'getHistory'
        ])
    },
    methods: {
        listenQuery(query) {
            this.query = query
        },
        blurInput() {
            this.$refs.searchBox.blur()
        },
        addQuery(txt) {
            this.$refs.searchBox.setQuery(txt)
        },
        saveSearch() {
            this.saveSearchHistory(this.query)
        },
        ...mapActions([
            'saveSearchHistory',
            'deleteSearchHistory'
        ])
    }
}

export const playerMixin ={
    computed: {
        iconMode() {
            return this.mode === playMode['sequence'] ? 'icon-list': this.mode === playMode['loop'] ? 'icon-loop':'icon-random'
        },
    },
}