<template>
	<div class="content">
		<div v-html="doc"></div>
	</div>
</template>

<script>
	import api from './api/api'
	export default {
		data(){
			return{
				doc: '',
			}
		},
		created(){
			this.callinterface();
		},
	
		methods: {
			callinterface(){
				api.Protocal('MZSM_zh_HK')
				.then((res) => {
					this.doc = res.data
				}).catch(() => {

				}).finally(() => {

				})
			}
		},
	}
</script>

<style>
	.content{
		width: 100%;
		height: 100%;
		padding: 0.625rem 0.625rem 3.125rem 0.625rem;
		box-sizing: border-box;
		border-top: 0.0625rem solid #efece8;
		font-size: 0.9375rem;
	}
</style>