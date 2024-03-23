install_milvus:
	# https://milvus.io/docs/install_standalone-docker.md
	wget https://raw.githubusercontent.com/milvus-io/milvus/master/scripts/standalone_embed.sh
	

run_milvus:
	bash standalone_embed.sh start