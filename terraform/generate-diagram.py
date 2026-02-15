from diagrams import Cluster, Diagram, Edge
from diagrams.gcp.compute import Run
from diagrams.gcp.devtools import ContainerRegistry
from diagrams.gcp.security import Iam, KMS
from diagrams.gcp.ml import AIPlatform
from diagrams.onprem.vcs import Github
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
    github = Github("GitHub Actions")
    cloudflare = Cloudflare("Cloudflare DNS")

    with Cluster("Google Cloud"):
        with Cluster("CI/CD"):
            wif = Iam("Workload Identity")
            ar = ContainerRegistry("Artifact Registry")

        with Cluster("Cloud Run"):
            frontend = Run("Frontend")
            backend = Run("Backend")

        secrets = KMS("Secret Manager")
        vertex = AIPlatform("Vertex AI")

    # User flow
    user >> cloudflare >> frontend
    cloudflare >> backend
    frontend >> Edge(label="API") >> backend

    # Backend services
    backend >> secrets
    backend >> vertex

    # CI/CD flow
    github >> Edge(label="OIDC") >> wif >> ar
    ar >> Edge(style="dashed", label="deploy") >> frontend
    ar >> Edge(style="dashed", label="deploy") >> backend
