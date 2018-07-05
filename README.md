		
**功能1--curl**										
功能描述										
	curl指定Accept返回对应格式的内容									
										
启动										
	node app.js									
										
主要代码url										
	C:\work\task\JSON-LD\code\jsonld-project\app.js					(app.get(/\/T(.+)/)				
										
测试例子

	curl  --header "Accept: application/json" -L http://localhost:3000/Ttest							//测试json		
  
	curl  --header "Accept: text/html" -L http://localhost:3000/Ttest							//测试html		
  
	curl  --header "Accept: application/json" -L http://localhost:3000/Ttes							//测试404		
  
							
**功能2--shacl-validate**		

•	turtle  验证		

	启动									
		node index.1.js			
    
	浏览器输入									
		http://localhost:3000/t								
								
										
•	jsonld 验证			

	描述									
		从两个URL中获取shape和data文件并写入到本地进行验证			
    
	启动									
		node index.2.js				
    
	浏览器输入									
		http://localhost:3000/t								
						
										
**功能3--d3.js**										
	直接访问：									
		http://localhost:3000/d3_tree.html								
