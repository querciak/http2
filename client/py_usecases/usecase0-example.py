from hyper import HTTPConnection
import json

url = 'jsonplaceholder.typicode.com'
path = '/todos/1'

conn = HTTPConnection(url)
conn.request('GET', path)
resp = conn.get_response()
print(json.loads(resp.read()))
