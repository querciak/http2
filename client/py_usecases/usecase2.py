from hyper import HTTPConnection
import json
import base64

#url ='https://jsonplaceholder.typicode.com'
path_trace="sample_data/trace/metadata.json" 
path_files="sample_data/trace/"
count = 0
with open(path_trace) as json_file:
    data = json.load(json_file)
    print( "start : "+data['start'])
    print("end : "+data['end'])
    for p in data['route']:
        with open(path_files+"gsv_"+str(count)+".jpg", "rb") as image_file:
              encoded_string = base64.b64encode(image_file.read()) 
        print('co-ords: ' + str(p)) 
        print("image str:"+ encoded_string)
        print("==================================================================================")
        count=count +1
conn = HTTPConnection('jsonplaceholder.typicode.com')
conn.request('GET', '/')
resp = conn.get_response()


#print(resp.read())

