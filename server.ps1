$port = 8000
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "Serving HTTP on 127.0.0.1 port $port ..."

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $localPath = "C:\Users\d.karetiya\.gemini\antigravity\scratch\employee-training-plan" + $request.Url.LocalPath.Replace("/", "\")
        
        if ($localPath.EndsWith("\")) {
            $localPath += "index.html"
        }

        if (Test-Path $localPath -PathType Leaf) {
            $content = [System.IO.File]::ReadAllBytes($localPath)
            $response.ContentLength64 = $content.Length
            $response.ContentType = "text/html"
            $response.OutputStream.Write($content, 0, $content.Length)
            Write-Host "200 GET $($request.Url.LocalPath)"
        } else {
            $response.StatusCode = 404
            Write-Host "404 GET $($request.Url.LocalPath)"
        }
        $response.Close()
    }
} finally {
    $listener.Stop()
}
