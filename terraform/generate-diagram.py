from diagrams import Cluster, Diagram, Edge
from diagrams.gcp.compute import Run
from diagrams.gcp.ml import AIPlatform
from diagrams.saas.cdn import Cloudflare
from diagrams.onprem.client import User

with Diagram(
    "Yorimichi Map - Architecture",
    filename="architecture",
    show=False,
    outformat="png",
    direction="LR",
):
    user = User("User")
    cloudflare = Cloudflare("Cloudflare DNS")

    with Cluster("Google Cloud"):
        with Cluster("Cloud Run"):
            frontend = Run("Frontend")
            backend = Run("Backend")
        vertex = AIPlatform("Vertex AI")

    # User flow
    user >> cloudflare >> frontend
    cloudflare >> backend
    frontend >> Edge(label="API") >> backend
    backend >> vertex
