		
**功能1--curl**										
功能描述										
	curl指定Accept返回对应格式的内容									
										
启动										
	node index.js									
										
主要代码url										
	jsonld-project\app.js	(app.get(/\/(.+)/)				
										
测试例子

	curl  --header "Accept: application/json" -L https://sleepy-oasis-49343.herokuapp.com/test  //测试json		
  
	curl  --header "Accept: text/html" -L https://sleepy-oasis-49343.herokuapp.com/test	//测试html		
  
	curl  --header "Accept: application/json" -L https://sleepy-oasis-49343.herokuapp.com/test  //测试404		
  
							
**功能2--shacl-validate**		

•	turtle  验证				
    
	浏览器输入									
		https://sleepy-oasis-49343.herokuapp.com/t								
								
										
•	jsonld 验证			

	描述									
		从两个URL中获取shape和data文件并写入到本地进行验证						
    
	浏览器输入									
		https://sleepy-oasis-49343.herokuapp.com/t_jsonld								
						
										
**功能3--d3.js**										
	直接访问：									
		https://sleepy-oasis-49343.herokuapp.com/d3_tree.html								
