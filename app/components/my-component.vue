<template>
	<div class="block">
		我的组件{{ msg }}，来自：{{ name }}
		<span>hehehe</span>
	</div>
</template>

<style lang="sass">
.block {
	color: blue;
	& span{
		color: purple;
	}
}
</style>

<script>
module.exports = {
	props: ['name'],
	data: function(){
		return {
			msg: 'my-comp'
		};
	},
	methods: {

	}
};
</script>