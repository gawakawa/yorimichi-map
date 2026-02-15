from diagrams import Cluster, Diagram, Edge
from diagrams.gcp.compute import Run
from diagrams.gcp.devtools import ContainerRegistry
from diagrams.gcp.security import Iam, KMS
from diagrams.gcp.ml import AIPlatform
from diagrams.onprem.vcs import Github
from diagrams.saas.cdn import Cloudflare
from diagrams.onprem.client import User

with Diagram(
    "Yorimichi Map - GCP Architecture",
    filename="architecture",
    show=False,
    outformat="png",
    direction="TB",
):
    user = User("User")
    cloudflare = Cloudflare("Cloudflare DNS")
    github = Github("GitHub Actions")

    with Cluster("Workload Identity Federation"):
        wif = Iam("OIDC")
        sa_github = Iam("SA: github-actions")

    with Cluster("Artifact Registry"):
        ar = ContainerRegistry("yorimichi-map")

    with Cluster("Cloud Run (asia-northeast1)"):
        frontend = Run("Frontend\n:8080")
        backend = Run("Backend\n:8000")

    with Cluster("Backend Services"):
        secrets = KMS("Secret Manager")
        vertex = AIPlatform("Vertex AI\nGemini")

    sa_cloudrun = Iam("SA: cloudrun-runtime")

    # User flow
    user >> cloudflare >> [frontend, backend]
    frontend >> Edge(style="dashed", label="API") >> backend

    # CI/CD flow
    github >> Edge(label="OIDC") >> wif >> sa_github
    sa_github >> Edge(label="push") >> ar
    ar >> Edge(style="dashed", label="deploy") >> [frontend, backend]

    # Backend services
    backend >> vertex
    sa_cloudrun >> Edge(style="dashed") >> [secrets, vertex]
